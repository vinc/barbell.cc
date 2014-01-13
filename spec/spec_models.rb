require 'bacon'

require './app'

shared Weigth do
  before do
    @weigth = Weigth.new
  end

  it 'has a unit' do
    @weigth.unit = 'kg'
    @weigth.unit.should.equal 'kg'
  end

  it 'has a weigth' do
    @weigth.weigth = 75
    @weigth.weigth.should.equal 75
  end

  describe 'Weigth.parse_weigth(str)' do
    it 'parse a string with a value and a unit' do
      @weigth.parse_weigth('75kg')
      @weigth.weigth.should.equal 75
      @weigth.unit.should.equal 'kg'

      @weigth.parse_weigth('165lb')
      @weigth.weigth.should.equal 165
      @weigth.unit.should.equal 'lb'
    end

    it 'parse a string with a value and default to kilograms' do
      @weigth.parse_weigth('75')
      @weigth.weigth.should.equal 75
      @weigth.unit.should.equal 'kg'
    end
  end
end

describe User do
  behaves_like Weigth

  before do
    @user = User.new('women')
  end

  it 'has a gender' do
    @user.gender.should.equal 'women'
  end
end

describe Lift do
  behaves_like Weigth

  before do
    @lift = Lift.new('squat')
  end

  it 'has a global database' do
    Lift.db.should.not.be.nil?
    Lift.db['squat']['men'][114][0].should.equal 80
  end

  it 'has a name' do
    @lift.name.should.equal 'squat'
  end

  describe 'Lift.all' do
    it 'load all lifts' do
      lifts = Lift.all
      lifts.size.should.equal Lift.db.size
      lifts.first.class.should.equal Lift
      lifts.map(&:name).should.include 'squat'
    end
  end

  describe 'Lift.standards(user)' do
    before do
      @user = User.new('men')
      @user.parse_weigth('70kg')
    end

    it 'returns standards for user' do
      standards = @lift.standards(@user)
      standards['novice'].should.equal 65
      standards['intermediate'].should.equal 79
    end

    it 'use lift unit if provided or default to user unit' do
      @lift.unit = 'lb'
      standards = @lift.standards(@user)
      standards['novice'].should.equal 145
      standards['novice'].should.not.equal 65
    end

    it 'should raise if no database' do
      Lift.db = nil
      @user = User.new('men')
      should.raise(RuntimeError) do
        @lift.standards(@user)
      end
    end

    it 'should raise if user has no weigth' do
      @user = User.new('men')
      should.raise(RuntimeError) do
        @lift.standards(@user)
      end
    end

    it 'should raise if lift nor user has unit' do
      @user = User.new('men')
      @user.weigth = 75
      should.raise(RuntimeError) do
        @lift.standards(@user)
      end
    end
  end
end
