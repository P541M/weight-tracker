# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Find or create a user with the specified email.
# If the user doesn't exist, it creates one with the given password.
user = User.find_or_create_by!(email: "dean@example.com") do |user|
    user.password = "password"
    user.password_confirmation = "password"
end

# Define a method to create weight entries for a user, simulating weight loss over a period of time.
# The method calculates daily weight loss and creates a weight entry for each day within the specified date range.
def create_weight_entries(user, start_weight:, end_weight:, start_date:, end_date:)
    # Calculate the daily weight loss based on the total weight loss and the number of days.
    daily_weight_loss = (start_weight - end_weight).to_f / (end_date - start_date).to_i
    current_weight = start_weight
  
    # Iterate over each date in the specified date range.
    (start_date..end_date).each do |date|
      puts "Creating weight entry for #{date}..."
      # Add a random daily fluctuation to simulate real-life weight changes.
      fluctuation = rand(-2.0..2.0)
      current_weight -= daily_weight_loss + fluctuation
      # Ensure the current weight does not go below the target end weight.
      current_weight = [current_weight, end_weight].max
  
      # Create a weight entry for the user with the current date and weight.
      user.weights.create(date: date, value: current_weight, unit: 'lbs')
    end
end

# Call the method to create weight entries for the user, simulating a weight loss from 195 lbs to 175 lbs
# over a period of two years up to the current date.
create_weight_entries(user,
  start_weight: 195.0,
  end_weight: 175.0,
  start_date: 2.years.ago.to_date,
  end_date: Date.today)
