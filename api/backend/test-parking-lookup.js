const mongoose = require('mongoose');

// Test the new findByIdOrParkingId method
async function testParkingLookup() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/smart-parking', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Import the Parking model
    const Parking = require('./src/models/Parking.js');
    
    // Test 1: Try to find by string parkingId (like "parking_001")
    console.log('\n🧪 Test 1: Finding by string parkingId "parking_001"');
    try {
      const parkingByString = await Parking.findByIdOrParkingId('parking_001');
      if (parkingByString) {
        console.log('✅ Found parking by string parkingId:', parkingByString.parkingId);
      } else {
        console.log('ℹ️  No parking found with parkingId "parking_001" (this is expected if no such parking exists)');
      }
    } catch (error) {
      console.log('❌ Error finding by string parkingId:', error.message);
    }
    
    // Test 2: Try to find by valid ObjectId (this should work)
    console.log('\n🧪 Test 2: Finding by valid ObjectId');
    try {
      // Create a test parking to get a valid ObjectId
      const testParking = await Parking.create({
        name: 'Test Parking for Lookup',
        parkingId: 'test_parking_001',
        location: {
          type: 'Point',
          coordinates: [10.0, 20.0]
        },
        parkingType: 'opensky',
        paymentType: 'free',
        ownershipType: 'private',
        capacity: {
          car: 10,
          bike: 5,
          bus_truck: 2
        },
        owner: new mongoose.Types.ObjectId(), // Dummy owner ID
        isActive: true,
        isApproved: true
      });
      
      console.log('✅ Created test parking with ObjectId:', testParking._id);
      
      // Test finding by ObjectId
      const parkingByObjectId = await Parking.findByIdOrParkingId(testParking._id);
      if (parkingByObjectId) {
        console.log('✅ Found parking by ObjectId:', parkingByObjectId.name);
      } else {
        console.log('❌ Failed to find parking by ObjectId');
      }
      
      // Test finding by string parkingId
      const parkingByStringId = await Parking.findByIdOrParkingId('test_parking_001');
      if (parkingByStringId) {
        console.log('✅ Found parking by string parkingId:', parkingByStringId.name);
      } else {
        console.log('❌ Failed to find parking by string parkingId');
      }
      
      // Clean up - delete test parking
      await Parking.findByIdAndDelete(testParking._id);
      console.log('✅ Cleaned up test parking');
      
    } catch (error) {
      console.log('❌ Error in ObjectId test:', error.message);
    }
    
    // Test 3: Try to find by invalid ObjectId format
    console.log('\n🧪 Test 3: Finding by invalid ObjectId format');
    try {
      const parkingByInvalidId = await Parking.findByIdOrParkingId('invalid_object_id');
      if (parkingByInvalidId) {
        console.log('✅ Found parking by invalid ObjectId (should not happen):', parkingByInvalidId.name);
      } else {
        console.log('ℹ️  No parking found with invalid ObjectId (this is expected)');
      }
    } catch (error) {
      console.log('❌ Error finding by invalid ObjectId:', error.message);
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testParkingLookup();
