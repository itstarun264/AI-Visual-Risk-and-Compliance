"""Reset the local database to an empty application state.

Accounts and activity records are created only through the API. This command no
longer inserts demonstration users or sample finance, study, habit, or alert data.
"""
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine


def reset_database() -> None:
    print("Recreating empty database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database initialized without sample data.")


if __name__ == "__main__":
    reset_database()
