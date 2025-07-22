package data

import "time"

type UserPlace struct {
	OsmID     string     `json:"osmID"`
	Tags      []string   `json:"tags"`
	Rating    *int8      `json:"rating"`
	VisitedAt *time.Time `json:"visitedAt"`
	RatedAt   *time.Time `json:"ratedAt"`
}
