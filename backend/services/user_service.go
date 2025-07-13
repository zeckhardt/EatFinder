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
	user.RatedPlaces = []data.Rating{}

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

func CreateRating(ctx context.Context, userID string, rating data.Rating) (string, error) {
	user, docSnap, err := getUserByID(ctx, userID)
	if err != nil {
		return "", err
	}

	if rating.OsmID == "" {
		return "", errors.New("missing OsmID in rating")
	}

	user.RatedPlaces = append(user.RatedPlaces, rating)

	if err := saveUser(ctx, user, docSnap); err != nil {
		return "", err
	}

	return rating.OsmID, nil
}

func GetRating(ctx context.Context, userID string, osmID string) (*data.Rating, error) {
	user, _, err := getUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	_, rating := findRatingById(user.RatedPlaces, osmID)
	if rating == nil {
		return nil, errors.New("rating not found")
	}

	return rating, nil
}
