package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Report struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ReporterID string             `bson:"reporterId" json:"reporterId"`
	ReportedID string             `bson:"reportedId" json:"reportedId"`
	RoomID     string             `bson:"roomId" json:"roomId"`
	Reason     string             `bson:"reason" json:"reason"`
	CreatedAt  time.Time          `bson:"createdAt" json:"createdAt"`
}

type AnalyticsEvent struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Type        string             `bson:"type" json:"type"` // session_start, session_end, skip
	UserID      string             `bson:"userId" json:"userId"`
	RoomID      string             `bson:"roomId" json:"roomId"`
	Duration    int64              `bson:"duration,omitempty" json:"duration,omitempty"` // seconds
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
}
