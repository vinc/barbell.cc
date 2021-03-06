class Weigth
  attr_accessor :weigth, :unit

  def parse_weigth(str)
    matches = str.match(/(?<weigth>\d+)(?<unit>kg|lb)?/)
    @unit = matches[:unit] || 'kg'
    @weigth = matches[:weigth].to_i
  end

  def to_hash
    { weigth: @weigth, unit: @unit }
  end
end

class User < Weigth
  attr_accessor :gender

  def initialize(gender)
    @gender = gender
  end

  def to_hash
    super.merge(gender: @gender)
  end
end

class Lift < Weigth
  attr_accessor :name

  class << self
    attr_accessor :db
  end

  def self.all
    Lift.db.keys.map { |name| Lift.new(name) }
  end

  def initialize(name)
    @name = name
  end

  def to_hash
    super.merge(name: @name)
  end

  def standards(user)
    raise 'No database provided' if Lift.db.nil?
    raise 'No weigth provided' if user.weigth.nil?
    unit = @unit.nil? ? user.unit : @unit
    raise 'No weigth unit provided' if unit.nil?
    scores = %w(untrained novice intermediate advanced elite)
    Lift.db[@name]['std'][user.gender].each do |category, values|
      if unit == 'kg'
        category = (category / 2.2).to_i
        values = values.map { |v| (v / 2.2).to_i }
      end
      next if user.weigth > category
      return Hash[scores.zip(values)]
    end
  end
end
