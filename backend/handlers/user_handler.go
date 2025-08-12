package handlers

import (
	"backend/data"
	"backend/services"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	svix "github.com/svix/svix-webhooks/go"
)

const (
	UserCreatedEvent = "user.created"
	UserDeletedEvent = "user.deleted"
)

func ClerkWebhook(c *gin.Context) {
	webhookSecret := os.Getenv("CLERK_WEBHOOK_SECRET")
	body, _ := io.ReadAll(c.Request.Body)
	svixID := c.GetHeader("svix-id")
	svixTimestamp := c.GetHeader("svix-timestamp")
	svixSignature := c.GetHeader("svix-signature")
	wh, err := svix.NewWebhook(webhookSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create webhook verifier"})
		return
	}
	err = wh.Verify(body, http.Header{
		"Svix-Id":        []string{svixID},
		"Svix-Timestamp": []string{svixTimestamp},
		"Svix-Signature": []string{svixSignature},
	})
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid webhook signature"})
		return
	}

	var payload data.ClerkWebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}

	switch payload.Type {
	case UserCreatedEvent:
		if err := handleUserCreated(c, payload.Data); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + err.Error()})
			return
		}
	case UserDeletedEvent:
		if err := handleUserDeleted(c, payload.Data.ID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user: " + err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Webhook processed successfully"})
}

func handleUserCreated(c *gin.Context, clerkUser data.ClerkUserData) error {
	user := convertClerkUserToUser(clerkUser)
	_, err := services.CreateUser(c.Request.Context(), &user)
	if err != nil {
		if err.Error() == "user already exists" {
			return nil
		}
		return err
	}
	return nil
}

func handleUserDeleted(c *gin.Context, userID string) error {
	return services.DeleteUserByID(c.Request.Context(), userID)
}

func convertClerkUserToUser(clerkUser data.ClerkUserData) data.User {
	return data.User{
		ID:            clerkUser.ID,
		Lists:         []data.List{},
		VisitedPlaces: []data.UserPlace{},
		CreatedOn:     time.Unix(clerkUser.CreatedAt/1000, 0),
	}
}

func CreateUser(c *gin.Context) {
	var newUser data.User
	if err := c.ShouldBindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	docId, err := services.CreateUser(c.Request.Context(), &newUser)
	if err != nil {
		if err.Error() == "user already exists" {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user":    newUser,
		"docID":   docId,
	})
}

func GetUser(c *gin.Context) {
	docId, err := services.GetUserByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting user: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": docId,
	})
}

func DeleteUser(c *gin.Context) {
	err := services.DeleteUserByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting user: " + err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

func VisitPlace(c *gin.Context) {
	userId := c.Param("id")
	var newLocation data.UserPlace
	if err := c.ShouldBindJSON(&newLocation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	place, err := services.VisitPlace(c.Request.Context(), userId, newLocation)
	if err != nil {
		if err.Error() == "user not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Place successfully added to visited list",
		"place":   place,
	})
}

func GetVisitedPlace(c *gin.Context) {
	place, err := services.GetVisitedPlace(c.Request.Context(), c.Param("id"), c.Query("osmID"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting list: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"place": place,
	})
}

func WatchPlace(c *gin.Context) {
	userId := c.Param("id")
	var newLocation data.UserPlace
	if err := c.ShouldBindJSON(&newLocation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	place, err := services.WatchPlace(c.Request.Context(), userId, newLocation)
	if err != nil {
		if err.Error() == "user not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Place successfully added to watch list",
		"place":   place,
	})
}

func GetWatchedPlace(c *gin.Context) {
	place, err := services.GetWatchedPlace(c.Request.Context(), c.Param("id"), c.Query("osmID"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting list: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"place": place,
	})
}

/*
func CreateRating(c *gin.Context) {
	userID := c.Param("id")
	var newRating data.Rating
	if err := c.ShouldBindJSON(&newRating); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	osmID, err := services.CreateRating(c.Request.Context(), userID, newRating)
	if err != nil {
		if err.Error() == "user not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Rating created successfully",
		"rating":  newRating,
		"osmID":   osmID,
	})
}

func GetRatings(c *gin.Context) {
	docId, err := services.GetRating(c.Request.Context(), c.Param("id"), c.Query("osmID"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting list: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"rating": docId,
	})
}
*/
