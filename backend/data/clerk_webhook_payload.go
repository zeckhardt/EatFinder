package data

type ClerkWebhookPayload struct {
	Data   ClerkUserData `json:"data"`
	Object string        `json:"object"`
	Type   string        `json:"type"`
}
