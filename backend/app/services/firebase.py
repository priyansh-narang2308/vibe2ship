import firebase_admin
from firebase_admin import credentials, firestore, storage
from app.core.config import settings

# Initialize Firebase Admin SDK
def initialize_firebase():
    if not firebase_admin._apps:
        try:
            if settings.FIREBASE_CREDENTIALS_PATH:
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred, {
                    'projectId': settings.FIREBASE_PROJECT_ID,
                    'storageBucket': settings.GCS_BUCKET_NAME
                })
            else:
                firebase_admin.initialize_app(options={
                    'projectId': settings.FIREBASE_PROJECT_ID,
                    'storageBucket': settings.GCS_BUCKET_NAME
                })
            print("Firebase Admin initialized successfully.")
        except Exception as e:
            print(f"WARNING: Error initializing Firebase: {e}. Ensure credentials are set.")

db_client = None
storage_bucket = None

def get_db():
    global db_client
    if db_client is None:
        initialize_firebase()
        try:
            db_client = firestore.client()
        except Exception as e:
            print(f"ERROR: Failed to retrieve Firestore client: {e}")
            raise e
    return db_client

def get_bucket():
    global storage_bucket
    if storage_bucket is None:
        initialize_firebase()
        try:
            storage_bucket = storage.bucket()
        except Exception as e:
            print(f"ERROR: Failed to retrieve GCS bucket: {e}")
            raise e
    return storage_bucket
