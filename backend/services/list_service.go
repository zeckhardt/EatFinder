package services

import (
	"backend/data"
	"backend/utils"
	"context"
	"errors"

	"github.com/google/uuid"
)

func CreateList(ctx context.Context, id string, list data.List) (string, error) {
	query := utils.FirestoreClient.Collection("users").Where("ID", "==", id).Limit(1)
	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return "", err
	}
	if len(docs) == 0 {
		return "", errors.New("user not found")
	}
	docSnap := docs[0]
	var user data.User
	if err := docSnap.DataTo(&user); err != nil {
		return "", err
	}

	if list.ID == "" {
		list.ID = uuid.New().String()
	}

	user.Lists = append(user.Lists, list)

	_, err = utils.FirestoreClient.Collection("users").Doc(docSnap.Ref.ID).Set(ctx, user)
	if err != nil {
		return "", err
	}

	return list.ID, nil
}

func GetListByName(ctx context.Context, userID string, listName string) (*data.List, error) {
	query := utils.FirestoreClient.Collection("users").Where("ID", "==", userID).Limit(1)
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

	for _, list := range user.Lists {
		if list.ListName == listName {
			return &list, nil
		}
	}

	return nil, errors.New("list not found")
}

func DeleteListByName(ctx context.Context, userID string, listName string) error {
	query := utils.FirestoreClient.Collection("users").Where("ID", "==", userID).Limit(1)
	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return err
	}
	if len(docs) == 0 {
		return errors.New("user not found")
	}
	docSnap := docs[0]
	var user data.User
	if err := docSnap.DataTo(&user); err != nil {
		return err
	}

	var postDelete []data.List
	for _, list := range user.Lists {
		if list.ListName != listName {
			postDelete = append(postDelete, list)
		}
	}

	user.Lists = postDelete
	_, err = utils.FirestoreClient.Collection("users").Doc(docSnap.Ref.ID).Set(ctx, user)
	if err != nil {
		return err
	}

	return nil
}
