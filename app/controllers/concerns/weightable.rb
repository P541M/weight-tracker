module Weightable
    extend ActiveSupport::Concern
  
    included do
      # Set the default unit before any action is taken
      before_action :set_default_unit
    end
  
    private
  
    # Method to determine the date range based on the selected time frame
    def date_range
      case params[:time_frame]
      when '7_days'
        # Return the range from 7 days ago to the end of the current day
        7.days.ago.beginning_of_day..Date.current.end_of_day
      when '30_days'
        # Return the range from 30 days ago to the end of the current day
        30.days.ago.beginning_of_day..Date.current.end_of_day
      when '90_days'
        # Return the range from 90 days ago to the end of the current day
        90.days.ago.beginning_of_day..Date.current.end_of_day
      when 'last_year'
        # Return the range from 1 year ago to the end of the current day
        1.year.ago.beginning_of_day..Date.current.end_of_day
      else
        # Return the range from the earliest weight entry to the end of the current day
        Weight.minimum(:date)..Date.current.end_of_day
      end
    end
  
    # Method to set the default unit for weight measurements
    def set_default_unit
      # Retrieve the preferred unit from cookies, default to 'kg' if not set
      @default_unit = cookies[:preferred_unit] || 'kg'
    end
  end
  