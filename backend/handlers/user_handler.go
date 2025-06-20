package handlers

import (
	"backend/data"
	"backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

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

	c.JSON(http.StatusOK, gin.H{
		"message": "User deleted successfully",
	})
}
