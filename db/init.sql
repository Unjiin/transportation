CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  pickup_city VARCHAR(255) NOT NULL,
  delivery_city VARCHAR(255) NOT NULL,
  distance_km NUMERIC(10,2) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
