package handlers

import (
	"context"
	"net/http"
	"time"

	"backend/data"
	"backend/utils"

	"github.com/gin-gonic/gin"
)

func CreateUser(c *gin.Context) {
	var newUser data.User
	if err := c.ShouldBindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := utils.FirestoreClient.Collection("users").Where("ID", "==", newUser.ID).Limit(1)
	docs, err := query.Documents(context.Background()).GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking user ID: " + err.Error()})
		return
	}
	if len(docs) > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this ID already exists"})
		return
	}

	newUser.CreatedOn = time.Now()
	newUser.Lists = []data.List{}

	docRef, _, err := utils.FirestoreClient.Collection("users").Add(context.Background(), newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error adding user to Firestore: " + err.Error()})
		return
	}

	firestoreDocID := docRef.ID
	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user":    newUser,
		"docID":   firestoreDocID,
	})
}

func GetUser(c *gin.Context) {
	id := c.Param("id")
	collectionName := "users"

	query := utils.FirestoreClient.Collection(collectionName).Where("ID", "==", id).Limit(1)
	docs, err := query.Documents(context.Background()).GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error querying Firestore: " + err.Error()})
		return
	}
	if len(docs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	docSnap := docs[0]

	var user data.User
	if err := docSnap.DataTo(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error mapping user data: " + err.Error()})
		return
	}
	user.ID = docSnap.Data()["ID"].(string)

	c.JSON(http.StatusOK, user)
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	collectionName := "users"

	query := utils.FirestoreClient.Collection(collectionName).Where("ID", "==", id).Limit(1)
	docs, err := query.Documents(context.Background()).GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error querying Firestore: " + err.Error()})
		return
	}
	if len(docs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	docID := docs[0].Ref.ID

	_, err = utils.FirestoreClient.Collection(collectionName).Doc(docID).Delete(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting user from Firestore: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
