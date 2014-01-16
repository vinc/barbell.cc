require 'digest'
require 'json'
require 'rack'
require 'rack/contrib'
require 'rack/parser'
require 'redis'
require 'sinatra'
require 'sinatra/param'
require 'sinatra/reloader' if development?
require 'slim'
require 'yaml'

require_relative 'models'

helpers do
  def redis
    @redis ||= Redis.new
  end
end

configure do
  Lift.db = YAML.load(open('./db.yml'))
  set :slim, pretty: true
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

get '/std' do
  @lifts = {}
  @values = {}
  Lift.db.map do |k, v|
    @lifts[k] = v['name']
    @values[k] = { 'reps' => 1, 'value' => 0 }
  end
  slim :index
end

post '/std' do
  std = {}
  param('unit', String, in: ['kg', 'lb'], default: 'kg')
  param('gender', String, in: ['men', 'women'], default: 'men')
  param('weigth', Integer, default: 0)
  %w(unit gender weigth).each { |k| std[k] = params[k] }
  Lift.db.keys.each do |lift|
    param(lift, Hash, default: { 'reps' => 1, 'value' => 0 })
    std[lift] = params[lift]
  end
  data = std.to_json
  digest = Digest::SHA256.hexdigest(data)
  id = (2..(digest.length)).reduce do |r, i|
    r = digest[0..i]
    k = "std:#{r}"
    break r if redis.setnx(k, data) || redis.get(k) == data
  end
  headers['Location'] = "/std/#{id}"
  status(201)
end

get '/std/:id.?:format?' do |id, format|
  data = redis.get("std:#{id}")
  halt(404) if data.nil?
  if format == 'json'
    data
  else
    # { 'squat' => 'Squat', 'bench' => 'Bench Press' }
    @lifts = Hash[Lift.db.map { |k, v| [k, v['name']] }]
    @values = JSON.parse(data)
    slim :index
  end
end
