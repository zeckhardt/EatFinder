package routes

import (
	"backend/handlers"
	"backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{"error": "This is an API server use /api/ endpoints."})
	})

	webhookGroup := router.Group("/webhooks")
	{
		// Clerk webhook - no auth middleware since Clerk signs the requests
		webhookGroup.POST("/clerk", handlers.ClerkWebhook)
	}

	apiGroup := router.Group("/api")
	{

		authenticated := apiGroup.Group("")
		authenticated.Use(utils.APIKeyMiddleware())
		{
			authenticated.GET("/protected", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "You accessed a protected route within /api using an API Key!"})
			})

			authenticated.POST("/users", handlers.CreateUser)
			authenticated.GET("/users/:id", handlers.GetUser)
			authenticated.DELETE("/users/:id", handlers.DeleteUser)

			authenticated.POST("/users/:id/lists", handlers.CreateList)
			authenticated.GET("/users/:id/lists", handlers.GetList)
			authenticated.DELETE("/users/:id/lists", handlers.DeleteList)

			authenticated.POST("/users/:id/lists/:listName", handlers.AddToList)
			authenticated.DELETE("/users/:id/lists/:listName", handlers.RemoveFromList)

			authenticated.POST("/users/:id/ratings", handlers.CreateRating)
		}
	}
}
