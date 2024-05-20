class WeightsController < ApplicationController
  include Weightable
  before_action :set_weight, only: %i[ show edit update destroy ]
  before_action :authenticate_user!

  # GET /weights or /weights.json
  # Fetches the list of weights for the current user, orders them by date in descending order,
  # and paginates the results using the pagy gem.
  def index
    @pagy, @weights = pagy(current_user.weights.order(date: :desc))
  end

  # Custom dashboard action to display weights within a certain date range and their averages.
  # Responds to HTML and JSON formats.
  def dashboard
    @weights = current_user.weights.where(date: date_range)
    @averages = @weights.group(:date).average(:value)
    respond_to do |format|
      format.html
      format.json { render json: @averages }
    end
  end

  # GET /weights/1 or /weights/1.json
  # Shows the details of a specific weight entry.
  def show
  end

  # GET /weights/new
  # Initializes a new Weight object for the form.
  def new
    @weight = Weight.new
  end

  # GET /weights/1/edit
  # Fetches the specific weight entry for editing.
  def edit
  end

  # POST /weights or /weights.json
  # Creates a new weight entry for the current user. If the weight entry is saved successfully,
  # it redirects to the show page; otherwise, it re-renders the new form.
  def create
    @weight = Weight.new(weight_params.merge(user: current_user))

    respond_to do |format|
      if @weight.save
        format.html { redirect_to weight_url(@weight), notice: "Weight was successfully created." }
        format.json { render :show, status: :created, location: @weight }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @weight.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /weights/1 or /weights/1.json
  # Updates an existing weight entry. If the update is successful, it redirects to the show page;
  # otherwise, it re-renders the edit form.
  def update
    respond_to do |format|
      if @weight.update(weight_params)
        format.html { redirect_to weight_url(@weight), notice: "Weight was successfully updated." }
        format.json { render :show, status: :ok, location: @weight }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @weight.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /weights/1 or /weights/1.json
  # Deletes a specific weight entry. After deletion, it redirects to the weights list.
  def destroy
    @weight.destroy!

    respond_to do |format|
      format.html { redirect_to weights_url, notice: "Weight was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  # Finds the specific weight entry based on the id parameter. Ensures that the current user
  # is authorized to view the weight entry.
  def set_weight
    @weight = Weight.find(params[:id])
    redirect_to weights_url, notice: "You are not authorized to view this weight." unless @weight.user == current_user
  end

  # Only allow a list of trusted parameters through.
  # Specifies which parameters are permitted for weight entries.
  def weight_params
    params.require(:weight).permit(:value, :date, :unit)
  end
end
