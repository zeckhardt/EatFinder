package services

import (
	"backend/data"
	"backend/utils"
	"context"
	"errors"
	"time"
)

func CreateUser(cxt context.Context, user *data.User) (string, error) {
	query := utils.FirestoreClient.Collection("users").Where("ID", "==", user.ID).Limit(1)
	docs, err := query.Documents(cxt).GetAll()
	if err != nil {
		return "", err
	}
	if len(docs) > 0 {
		return "", errors.New("user already exists")
	}

	user.CreatedOn = time.Now()
	user.Lists = []data.List{}

	docRef, _, err := utils.FirestoreClient.Collection("users").Add(cxt, user)
	if err != nil {
		return "", err
	}
	firestoreDocID := docRef.ID
	return firestoreDocID, nil
}

func GetUserByID(ctx context.Context, id string) (*data.User, error) {
	query := utils.FirestoreClient.Collection("users").Where("ID", "==", id).Limit(1)
	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return nil, err
	}
	if len(docs) == 0 {
		return nil, errors.New("user not found")
	}
	docSnap := docs[0]
	var user data.User
	if err := docSnap.DataTo(&user); err != nil {
		return nil, err
	}
	user.ID = docSnap.Data()["ID"].(string)
	return &user, nil
}

func DeleteUserByID(cxt context.Context, id string) error {
	query := utils.FirestoreClient.Collection("users").Where("ID", "==", id).Limit(1)
	docs, err := query.Documents(cxt).GetAll()
	if err != nil {
		return err
	}
	if len(docs) == 0 {
		return errors.New("user not found")
	}

	docID := docs[0].Ref.ID
	_, err = utils.FirestoreClient.Collection("users").Doc(docID).Delete(cxt)
	if err != nil {
		return err
	}
	return nil
}
