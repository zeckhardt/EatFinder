package data

import "time"

// User represents a user that has logged into the app.
type User struct {
	ID            string      `json:"id" binding:"required"`
	Lists         []List      `json:"lists"`
	CreatedOn     time.Time   `json:"createdOn"`
	VisitedPlaces []UserPlace `json:"visitedPlaces"`
	WatchedPlaces []UserPlace `json:"watchedPlaces"`
}
