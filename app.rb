require 'json'
require 'sinatra'
require 'sinatra/param'
require 'sinatra/reloader' if development?
require 'slim'
require 'yaml'

require_relative 'models'

configure do
  Lift.db = YAML.load(open('./db.yml'))
end

get '/api/std/:user_gender/:user_weigth/:lift_name.json' do
  content_type(:json)
  @user = User.new(params['user_gender'])
  @user.parse_weigth(params['user_weigth'])

  @lift = Lift.new(params['lift_name'])
  @lift.standards(@user).to_json
end

get '/' do
  param('unit', String, in: ['kg', 'lb'], default: 'kg')
  param('gender', String, in: ['men', 'women'], default: 'men')
  param('weigth', Integer, default: 0)

  @lifts = {
    squat: 'Squat',
    bench: 'Bench Press',
    deadlift: 'Deadlift',
    press: 'Overhead Press',
    clean: 'Power Clean'
  }

  @lifts.keys.each do |l|
    param(l.to_s, Integer, default: 0)
  end

  slim :index
end
