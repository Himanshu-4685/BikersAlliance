// Script to add sample dealers to the database
// Run this with: node add-sample-dealers.js

const dealersData = [
  // Delhi NCR Region
  { name: 'Delhi Motors', address: 'Connaught Place, Central Delhi', city: 'Delhi', state: 'Delhi', pincode: '110001', phone: '+91-9876543210', email: 'info@delhimotors.com' },
  { name: 'Capital Bikes', address: 'Karol Bagh Market', city: 'Delhi', state: 'Delhi', pincode: '110005', phone: '+91-9876543211', email: 'sales@capitalbikes.com' },
  { name: 'NCR Auto Hub', address: 'Sector 18, Noida', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', phone: '+91-9876543212', email: 'contact@ncrautohub.com' },
  { name: 'Gurgaon Wheels', address: 'MG Road, Gurgaon', city: 'Gurgaon', state: 'Haryana', pincode: '122001', phone: '+91-9876543213', email: 'info@gurgaonwheels.com' },
  
  // Mumbai Region
  { name: 'Mumbai Motor Works', address: 'Andheri East', city: 'Mumbai', state: 'Maharashtra', pincode: '400069', phone: '+91-9876543214', email: 'sales@mumbaimotorworks.com' },
  { name: 'Marine Drive Motors', address: 'Nariman Point', city: 'Mumbai', state: 'Maharashtra', pincode: '400021', phone: '+91-9876543215', email: 'info@marinedrivemotors.com' },
  { name: 'Suburban Bikes', address: 'Borivali West', city: 'Mumbai', state: 'Maharashtra', pincode: '400092', phone: '+91-9876543216', email: 'contact@suburbanbikes.com' },
  { name: 'Thane Auto Center', address: 'Thane West', city: 'Thane', state: 'Maharashtra', pincode: '400601', phone: '+91-9876543217', email: 'sales@thaneautocenter.com' },
  { name: 'Pune Bike Junction', address: 'FC Road', city: 'Pune', state: 'Maharashtra', pincode: '411016', phone: '+91-9876543218', email: 'info@punebikejunction.com' },
  
  // Bangalore Region
  { name: 'Silicon City Motors', address: 'Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034', phone: '+91-9876543219', email: 'sales@siliconcitymotors.com' },
  { name: 'Garden City Bikes', address: 'MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', phone: '+91-9876543220', email: 'info@gardencitybikes.com' },
  { name: 'Whitefield Auto Hub', address: 'Whitefield Main Road', city: 'Bangalore', state: 'Karnataka', pincode: '560066', phone: '+91-9876543221', email: 'contact@whitefieldautohub.com' },
  { name: 'Electronic City Motors', address: 'Electronic City Phase 1', city: 'Bangalore', state: 'Karnataka', pincode: '560100', phone: '+91-9876543222', email: 'sales@electroniccitymotors.com' },
  
  // Chennai Region
  { name: 'Chennai Bike World', address: 'T. Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600017', phone: '+91-9876543223', email: 'info@chennabikeworld.com' },
  { name: 'Marina Motors', address: 'Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040', phone: '+91-9876543224', email: 'sales@marinamotors.com' },
  { name: 'South City Wheels', address: 'Velachery', city: 'Chennai', state: 'Tamil Nadu', pincode: '600042', phone: '+91-9876543225', email: 'contact@southcitywheels.com' },
  
  // Hyderabad Region
  { name: 'Hyderabad Auto Plaza', address: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034', phone: '+91-9876543226', email: 'info@hyderabadautoplaza.com' },
  { name: 'Cyberabad Motors', address: 'Madhapur', city: 'Hyderabad', state: 'Telangana', pincode: '500081', phone: '+91-9876543227', email: 'sales@cyberabadmotors.com' },
  { name: 'Nizamabad Bikes', address: 'Nizamabad Main Road', city: 'Nizamabad', state: 'Telangana', pincode: '503001', phone: '+91-9876543228', email: 'contact@nizamabadbikes.com' },
  
  // Kolkata Region
  { name: 'Kolkata Motor Hub', address: 'Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700016', phone: '+91-9876543229', email: 'info@kolkatamotorhub.com' },
  { name: 'City of Joy Bikes', address: 'Salt Lake City', city: 'Kolkata', state: 'West Bengal', pincode: '700064', phone: '+91-9876543230', email: 'sales@cityofjoybikes.com' },
  { name: 'Howrah Auto Center', address: 'Howrah Station Road', city: 'Howrah', state: 'West Bengal', pincode: '711101', phone: '+91-9876543231', email: 'contact@howrahautocenter.com' },
  
  // Gujarat Region
  { name: 'Ahmedabad Motor Works', address: 'CG Road', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009', phone: '+91-9876543232', email: 'info@ahmedabadmotorworks.com' },
  { name: 'Surat Bike Center', address: 'Ring Road', city: 'Surat', state: 'Gujarat', pincode: '395002', phone: '+91-9876543233', email: 'sales@suratbikecenter.com' },
  { name: 'Vadodara Wheels', address: 'Sayajigunj', city: 'Vadodara', state: 'Gujarat', pincode: '390005', phone: '+91-9876543234', email: 'contact@vadodarawheels.com' },
  { name: 'Rajkot Auto Hub', address: 'Kalawad Road', city: 'Rajkot', state: 'Gujarat', pincode: '360005', phone: '+91-9876543235', email: 'info@rajkotautohub.com' },
  
  // Rajasthan Region
  { name: 'Pink City Motors', address: 'MI Road', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', phone: '+91-9876543236', email: 'sales@pinkcitymotors.com' },
  { name: 'Jodhpur Bike World', address: 'Clock Tower Market', city: 'Jodhpur', state: 'Rajasthan', pincode: '342001', phone: '+91-9876543237', email: 'info@jodhpurbikeworld.com' },
  { name: 'Udaipur Motors', address: 'City Palace Road', city: 'Udaipur', state: 'Rajasthan', pincode: '313001', phone: '+91-9876543238', email: 'contact@udaipurmotors.com' },
  
  // Uttar Pradesh Region
  { name: 'Lucknow Auto Center', address: 'Hazratganj', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', phone: '+91-9876543239', email: 'info@lucknowautocenter.com' },
  { name: 'Kanpur Motor Works', address: 'Mall Road', city: 'Kanpur', state: 'Uttar Pradesh', pincode: '208001', phone: '+91-9876543240', email: 'sales@kanpurmotorworks.com' },
  { name: 'Agra Bike Junction', address: 'Taj Road', city: 'Agra', state: 'Uttar Pradesh', pincode: '282001', phone: '+91-9876543241', email: 'contact@agrabikejunction.com' },
  { name: 'Varanasi Motors', address: 'Godowlia Market', city: 'Varanasi', state: 'Uttar Pradesh', pincode: '221001', phone: '+91-9876543242', email: 'info@varanasimotors.com' },
  
  // Punjab Region
  { name: 'Chandigarh Auto Hub', address: 'Sector 17', city: 'Chandigarh', state: 'Punjab', pincode: '160017', phone: '+91-9876543243', email: 'sales@chandigarhautohub.com' },
  { name: 'Amritsar Bikes', address: 'Hall Bazaar', city: 'Amritsar', state: 'Punjab', pincode: '143001', phone: '+91-9876543244', email: 'info@amritsarbikes.com' },
  { name: 'Ludhiana Motor Center', address: 'Ferozepur Road', city: 'Ludhiana', state: 'Punjab', pincode: '141001', phone: '+91-9876543245', email: 'contact@ludhianamotorcenter.com' },
  
  // Madhya Pradesh Region
  { name: 'Bhopal Auto Plaza', address: 'MP Nagar', city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462011', phone: '+91-9876543246', email: 'info@bhopalautoplaza.com' },
  { name: 'Indore Motor Works', address: 'Vijay Nagar', city: 'Indore', state: 'Madhya Pradesh', pincode: '452010', phone: '+91-9876543247', email: 'sales@indoremotorworks.com' },
  { name: 'Gwalior Bikes', address: 'Lashkar', city: 'Gwalior', state: 'Madhya Pradesh', pincode: '474001', phone: '+91-9876543248', email: 'contact@gwaliorbikes.com' },
  
  // Bihar & Jharkhand Region
  { name: 'Patna Motor Hub', address: 'Boring Road', city: 'Patna', state: 'Bihar', pincode: '800001', phone: '+91-9876543249', email: 'info@patnamotorhub.com' },
  { name: 'Ranchi Auto Center', address: 'Main Road', city: 'Ranchi', state: 'Jharkhand', pincode: '834001', phone: '+91-9876543250', email: 'sales@ranchiautocenter.com' },
  { name: 'Dhanbad Bikes', address: 'Bank More', city: 'Dhanbad', state: 'Jharkhand', pincode: '826001', phone: '+91-9876543251', email: 'info@dhanbadbikes.com' },
  
  // Odisha Region
  { name: 'Bhubaneswar Motors', address: 'Kharavel Nagar', city: 'Bhubaneswar', state: 'Odisha', pincode: '751001', phone: '+91-9876543252', email: 'contact@bhubaneshwarmotors.com' },
  { name: 'Cuttack Auto Hub', address: 'Badambadi', city: 'Cuttack', state: 'Odisha', pincode: '753012', phone: '+91-9876543253', email: 'sales@cuttackautohub.com' },
  
  // Assam Region
  { name: 'Guwahati Bike Center', address: 'Fancy Bazaar', city: 'Guwahati', state: 'Assam', pincode: '781001', phone: '+91-9876543254', email: 'info@guwahatibikecenter.com' },
  { name: 'Dibrugarh Motors', address: 'Graham Bazaar', city: 'Dibrugarh', state: 'Assam', pincode: '786001', phone: '+91-9876543255', email: 'contact@dibrugarhwheels.com' },
  
  // Kerala Region
  { name: 'Kochi Auto Plaza', address: 'MG Road', city: 'Kochi', state: 'Kerala', pincode: '682035', phone: '+91-9876543256', email: 'sales@kochiautoplaza.com' },
  { name: 'Thiruvananthapuram Motors', address: 'Palayam', city: 'Thiruvananthapuram', state: 'Kerala', pincode: '695033', phone: '+91-9876543257', email: 'info@tvmmotors.com' },
  { name: 'Calicut Bike World', address: 'SM Street', city: 'Kozhikode', state: 'Kerala', pincode: '673001', phone: '+91-9876543258', email: 'contact@calicutbikeworld.com' },
  
  // Andhra Pradesh Region
  { name: 'Vijayawada Auto Center', address: 'Governorpet', city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520002', phone: '+91-9876543259', email: 'sales@vijayawadaautocenter.com' },
  { name: 'Visakhapatnam Motors', address: 'Dwaraka Nagar', city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530016', phone: '+91-9876543260', email: 'info@vizagmotors.com' },
  
  // Haryana Region
  { name: 'Faridabad Wheels', address: 'Sector 16', city: 'Faridabad', state: 'Haryana', pincode: '121002', phone: '+91-9876543261', email: 'contact@faridabadwheels.com' },
  { name: 'Rohtak Motor Hub', address: 'Model Town', city: 'Rohtak', state: 'Haryana', pincode: '124001', phone: '+91-9876543262', email: 'sales@rohtakmotorhub.com' },
  
  // Himachal Pradesh Region
  { name: 'Shimla Auto Works', address: 'Mall Road', city: 'Shimla', state: 'Himachal Pradesh', pincode: '171001', phone: '+91-9876543263', email: 'info@shimlautoworks.com' },
  { name: 'Dharamshala Bikes', address: 'McLeod Ganj', city: 'Dharamshala', state: 'Himachal Pradesh', pincode: '176219', phone: '+91-9876543264', email: 'contact@dharamshalabikes.com' },
  
  // Uttarakhand Region
  { name: 'Dehradun Motor Center', address: 'Rajpur Road', city: 'Dehradun', state: 'Uttarakhand', pincode: '248001', phone: '+91-9876543265', email: 'sales@dehradunmotorcenter.com' },
  { name: 'Haridwar Auto Hub', address: 'Railway Road', city: 'Haridwar', state: 'Uttarakhand', pincode: '249401', phone: '+91-9876543266', email: 'info@haridwarautohub.com' },
  
  // Goa Region
  { name: 'Panaji Bike Center', address: 'MG Road', city: 'Panaji', state: 'Goa', pincode: '403001', phone: '+91-9876543267', email: 'contact@panajibikecenter.com' },
  { name: 'Margao Motors', address: 'Fatorda', city: 'Margao', state: 'Goa', pincode: '403602', phone: '+91-9876543268', email: 'sales@margaomotors.com' },
  
  // Jammu & Kashmir Region
  { name: 'Srinagar Auto Works', address: 'Lal Chowk', city: 'Srinagar', state: 'Jammu and Kashmir', pincode: '190001', phone: '+91-9876543269', email: 'info@srinagarautoworks.com' },
  { name: 'Jammu Motor Hub', address: 'Raghunath Bazaar', city: 'Jammu', state: 'Jammu and Kashmir', pincode: '180001', phone: '+91-9876543270', email: 'contact@jammumotorhub.com' },
  
  // Chhattisgarh Region
  { name: 'Raipur Bike World', address: 'Pandri', city: 'Raipur', state: 'Chhattisgarh', pincode: '492004', phone: '+91-9876543271', email: 'sales@raipurbikeworld.com' },
  { name: 'Bilaspur Auto Center', address: 'Railway Colony', city: 'Bilaspur', state: 'Chhattisgarh', pincode: '495001', phone: '+91-9876543272', email: 'info@bilaspurautocenter.com' }
];

const BASE_URL = 'http://localhost:3000';

async function addDealersToDatabase() {
  console.log('🚀 Starting to add dealers to database...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < dealersData.length; i++) {
    const dealer = dealersData[i];
    
    try {
      console.log(`Adding dealer ${i + 1}/${dealersData.length}: ${dealer.name} (${dealer.city}, ${dealer.state})`);
      
      const response = await fetch(`${BASE_URL}/api/dealers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealer),
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Successfully added: ${dealer.name}`);
        successCount++;
      } else {
        console.log(`❌ Failed to add ${dealer.name}: ${result.error}`);
        failCount++;
      }
      
      // Add a small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`❌ Error adding ${dealer.name}:`, error.message);
      failCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Successfully added: ${successCount} dealers`);
  console.log(`❌ Failed to add: ${failCount} dealers`);
  console.log(`📈 Total processed: ${successCount + failCount} dealers`);
  console.log('\n🎉 Dealer data addition completed!');
}

// Run the script
addDealersToDatabase().catch(console.error);