package data

type Rating struct {
	OsmID  string   `json:"osmID"`
	Tags   []string `json:"tags"`
	Rating int8     `json:"rating"`
}
