package data

// List represents a collection of places on the map.
type List struct {
	ListName string  `json:"list_name"`
	Places   []Place `json:"places"`
}
