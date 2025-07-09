package data

type ClerkUserData struct {
	ID               string                 `json:"id"`
	EmailAddresses   []ClerkEmailAddress    `json:"email_addresses"`
	FirstName        *string                `json:"first_name"`
	LastName         *string                `json:"last_name"`
	Username         *string                `json:"username"`
	ImageURL         string                 `json:"image_url"`
	CreatedAt        int64                  `json:"created_at"`
	UpdatedAt        int64                  `json:"updated_at"`
	ExternalAccounts []ClerkExternalAccount `json:"external_accounts"`
}
