require './app'

use Rack::NestedParams
use Rack::PostBodyContentTypeParser # FIXME: Replaced by Rack::Parser
use Rack::Parser
run Sinatra::Application
