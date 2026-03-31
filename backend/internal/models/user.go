package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email        string             `bson:"email" json:"email"`
	Username     string             `bson:"username" json:"username"`
	PasswordHash string             `bson:"passwordHash" json:"-"`
	IsVerified   bool               `bson:"isVerified" json:"isVerified"`
	CreatedAt    time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type PublicUser struct {
	ID         string    `json:"id"`
	Email      string    `json:"email"`
	Username   string    `json:"username"`
	IsVerified bool      `json:"isVerified"`
	CreatedAt  time.Time `json:"createdAt"`
}

func (u *User) ToPublic() PublicUser {
	return PublicUser{
		ID:         u.ID.Hex(),
		Email:      u.Email,
		Username:   u.Username,
		IsVerified: u.IsVerified,
		CreatedAt:  u.CreatedAt,
	}
}
