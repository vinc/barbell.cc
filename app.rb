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

before '*.json' do
  content_type(:json)
end

before '/api/std/:user_gender/:user_weigth/*' do
  @user = User.new(params['user_gender'])
  @user.parse_weigth(params['user_weigth'])
end

get '/api/std/:user_gender/:user_weigth/lifts.json' do
  Lift.all.reduce({}) do |hash, lift|
    hash.merge(lift.name => lift.standards(@user))
  end.to_json
end

get '/api/std/:user_gender/:user_weigth/lifts/:lift_name.json' do
  lift = Lift.new(params['lift_name'])
  lift.standards(@user).to_json
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
