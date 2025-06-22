package data

// List represents a collection of places on the map.
type List struct {
	ID       string  `json:"id"`
	ListName string  `json:"list_name"`
	Places   []Place `json:"places"`
}
