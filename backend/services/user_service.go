package services

import (
	"backend/data"
	"backend/utils"
	"context"
	"errors"
	"time"
)

func CreateUser(ctx context.Context, user *data.User) (string, error) {
	query := utils.FirestoreClient.Collection("users").Where("ID", "==", user.ID).Limit(1)
	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return "", err
	}
	if len(docs) > 0 {
		return "", errors.New("user already exists")
	}

	user.CreatedOn = time.Now()
	user.Lists = []data.List{}

	docRef, _, err := utils.FirestoreClient.Collection("users").Add(ctx, user)
	if err != nil {
		return "", err
	}
	return docRef.ID, nil
}

func GetUserByID(ctx context.Context, id string) (*data.User, error) {
	user, _, err := getUserByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func DeleteUserByID(ctx context.Context, id string) error {
	_, docSnap, err := getUserByID(ctx, id)
	if err != nil {
		return err
	}

	_, err = utils.FirestoreClient.Collection("users").Doc(docSnap.Ref.ID).Delete(ctx)
	return err
}
