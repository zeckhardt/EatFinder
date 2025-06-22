package services

import (
	"backend/data"
	"context"
	"errors"

	"github.com/google/uuid"
)

func CreateList(ctx context.Context, userID string, list data.List) (string, error) {
	user, docSnap, err := getUserByID(ctx, userID)
	if err != nil {
		return "", err
	}

	if list.ID == "" {
		list.ID = uuid.New().String()
	}

	user.Lists = append(user.Lists, list)

	if err := saveUser(ctx, user, docSnap); err != nil {
		return "", err
	}

	return list.ID, nil
}

func GetListByName(ctx context.Context, userID string, listName string) (*data.List, error) {
	user, _, err := getUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	_, list := findListByName(user.Lists, listName)
	if list == nil {
		return nil, errors.New("list not found")
	}

	return list, nil
}

func DeleteListByName(ctx context.Context, userID string, listName string) error {
	user, docSnap, err := getUserByID(ctx, userID)
	if err != nil {
		return err
	}

	var postDelete []data.List
	for _, list := range user.Lists {
		if list.ListName != listName {
			postDelete = append(postDelete, list)
		}
	}

	user.Lists = postDelete
	return saveUser(ctx, user, docSnap)
}

func AppendPlace(ctx context.Context, userID string, listName string, place data.Place) (*data.Place, error) {
	user, docSnap, err := getUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	listIndex, _ := findListByName(user.Lists, listName)
	if listIndex == -1 {
		return nil, errors.New("list not found")
	}

	user.Lists[listIndex].Places = append(user.Lists[listIndex].Places, place)

	if err := saveUser(ctx, user, docSnap); err != nil {
		return nil, err
	}

	return &place, nil
}
