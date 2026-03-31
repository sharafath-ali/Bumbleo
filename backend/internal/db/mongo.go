package db

import (
	"context"
	"log"
	"time"

	"github.com/sharafath/bumbleo/internal/config"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client
var MongoDB *mongo.Database

func ConnectMongo(cfg *config.Config) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(cfg.MongoURI)
	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		log.Fatalf("MongoDB connect error: %v", err)
	}

	if err = client.Ping(ctx, nil); err != nil {
		log.Fatalf("MongoDB ping error: %v", err)
	}

	MongoClient = client
	MongoDB = client.Database(cfg.MongoDB)

	ensureIndexes()
	log.Println("✅  MongoDB connected:", cfg.MongoDB)
}

func ensureIndexes() {
	ctx := context.Background()

	usersCol := MongoDB.Collection("users")
	usersCol.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "username", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
	})

	reportsCol := MongoDB.Collection("reports")
	reportsCol.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "reporterId", Value: 1}}},
		{Keys: bson.D{{Key: "reportedId", Value: 1}}},
		{Keys: bson.D{{Key: "createdAt", Value: -1}}},
	})

	analyticsCol := MongoDB.Collection("analytics")
	analyticsCol.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "date", Value: -1}}},
	})
}

func GetCollection(name string) *mongo.Collection {
	return MongoDB.Collection(name)
}

func DisconnectMongo() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if MongoClient != nil {
		MongoClient.Disconnect(ctx)
	}
}
