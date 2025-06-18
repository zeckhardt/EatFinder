package utils

import (
	"context"
	"log"
	"os"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

var (
	FirebaseApp     *firebase.App
	AuthClient      *auth.Client
	FirestoreClient *firestore.Client
)

// InitFirebase Initializes the Firebase application, authentication client, and Firestore client
func InitFirebase() {
	serviceAccountKeyPath := os.Getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
	if serviceAccountKeyPath == "" {
		serviceAccountKeyPath = "./serviceAccountKey.json"
	}

	opt := option.WithCredentialsFile(serviceAccountKeyPath)
	var err error
	FirebaseApp, err = firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		log.Fatalf("error initializing Firebase app: %v\n", err)
	}

	AuthClient, err = FirebaseApp.Auth(context.Background())
	if err != nil {
		log.Fatalf("error getting Auth client: %v\n", err)
	}

	FirestoreClient, err = FirebaseApp.Firestore(context.Background())
	if err != nil {
		log.Fatalf("error getting Firestore client: %v\n", err)
	}

	log.Println("Firebase and Firestore initialized successfully!")
}

// CloseFirestoreClient closes the Firestore client connection
func CloseFirestoreClient() {
	if FirestoreClient != nil {
		err := FirestoreClient.Close()
		if err != nil {
			log.Printf("Error closing Firestore client: %v\n", err)
		} else {
			log.Println("Firestore client closed.")
		}
	}
}
