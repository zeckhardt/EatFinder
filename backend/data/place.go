package data

// Place represents a specific place with OSM data enclosed.
type Place struct {
	OsmID   string  `json:"osm_id"`
	OsmType string  `json:"osm_type"`
	Long    float64 `json:"long"`
	Lat     float64 `json:"lat"`
}
