package services

import (
	"backend/data"
	"context"
	"encoding/json"
	"log"
	"net/http"

	"firebase.google.com/go/v4/auth"
	"firebase.google.com/go/v4/db"
)

type UserService struct {
	dbClient   *db.Client
	authClient *auth.Client
}

func NewUserService(dbClient *db.Client, authClient *auth.Client) *UserService {
	return &UserService{
		dbClient:   dbClient,
		authClient: authClient,
	}
}

func (s *UserService) CreateUser(r *http.Request, userID string) (*data.User, error) {
	var user data.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		return nil, err
	}

	user.ID = userID

	ctx := context.Background()
	ref := s.dbClient.NewRef("users/" + userID)

	if err := ref.Set(ctx, user); err != nil {
		return nil, err
	}

	return &user, nil
}

func (s *UserService) GetUser(userID string) (*data.User, error) {
	ctx := context.Background()
	ref := s.dbClient.NewRef("users/" + userID)

	var user data.User
	if err := ref.Get(ctx, &user); err != nil {
		return nil, err
	}

	return &user, nil
}

func (s *UserService) UpdateUser(r *http.Request, userID string) error {
	var updates map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		return err
	}

	ctx := context.Background()
	ref := s.dbClient.NewRef("users/" + userID)

	return ref.Update(ctx, updates)
}

func (s *UserService) DeleteUser(userID string) error {
	ctx := context.Background()

	ref := s.dbClient.NewRef("users/" + userID)
	if err := ref.Delete(ctx); err != nil {
		return err
	}

	if err := s.authClient.DeleteUser(ctx, userID); err != nil {
		log.Printf("Failed to delete user from auth: %v", err)
	}

	return nil
}
