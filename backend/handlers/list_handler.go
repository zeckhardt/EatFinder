package handlers

import (
	"net/http"

	"backend/data"
	"backend/services"

	"github.com/gin-gonic/gin"
)

func CreateList(c *gin.Context) {
	userId := c.Param("id")
	var newList data.List
	if err := c.ShouldBindJSON(&newList); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	listID, err := services.CreateList(c.Request.Context(), userId, newList)
	if err != nil {
		if err.Error() == "user not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "List created successfully",
		"list":    newList,
		"listID":  listID,
	})
}

func GetList(c *gin.Context) {
	docId, err := services.GetListByName(c.Request.Context(), c.Param("id"), c.Query("name"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting list: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"list": docId,
	})
}

func DeleteList(c *gin.Context) {
	err := services.DeleteListByName(c.Request.Context(), c.Param("id"), c.Query("name"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting list: " + err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

func AddToList(c *gin.Context) {

	var newPlace data.Place
	if err := c.ShouldBindJSON(&newPlace); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	place, err := services.AppendPlace(c.Request.Context(), c.Param("id"), c.Param("listName"), newPlace)
	if err != nil {
		if err.Error() == "user not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Place added successfully",
		"place":   place,
	})
}

func RemoveFromList(c *gin.Context) {
	err := services.RemovePlace(c.Request.Context(), c.Param("id"), c.Param("listName"), c.Query("osmID"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting place: " + err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
