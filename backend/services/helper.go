package services

import (
	"backend/data"
	"backend/utils"
	"context"
	"errors"

	"cloud.google.com/go/firestore"
)

func getUserByID(ctx context.Context, userID string) (*data.User, *firestore.DocumentSnapshot, error) {
	query := utils.FirestoreClient.Collection("users").Where("ID", "==", userID).Limit(1)
	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return nil, nil, err
	}
	if len(docs) == 0 {
		return nil, nil, errors.New("user not found")
	}

	docSnap := docs[0]
	var user data.User
	if err := docSnap.DataTo(&user); err != nil {
		return nil, nil, err
	}

	return &user, docSnap, nil
}

func saveUser(ctx context.Context, user *data.User, docSnap *firestore.DocumentSnapshot) error {
	_, err := utils.FirestoreClient.Collection("users").Doc(docSnap.Ref.ID).Set(ctx, user)
	return err
}

func findListByName(lists []data.List, listName string) (int, *data.List) {
	for i, list := range lists {
		if list.ListName == listName {
			return i, &lists[i]
		}
	}
	return -1, nil
}

func findRatingById(ratings []data.Rating, osmID string) (int, *data.Rating) {
	for i, rating := range ratings {
		if rating.OsmID == osmID {
			return i, &ratings[i]
		}
	}
	return -1, nil
}
