package data

// Place represents a specific place with OSM data enclosed.
type Place struct {
	OsmID   string `json:"osm_id"`
	OsmType string `json:"osm_type"`
}
