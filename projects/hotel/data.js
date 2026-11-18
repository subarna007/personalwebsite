// Everything the site shows. Prices are in Nepali rupees (NPR).
const HOTEL = {
  name: "All in One Hotel",
  town: "Lakeside, Pokhara",
  phone: "+977 61 000 000",
  email: "stay@allinonehotel.example",
};

const ROOMS = [
  { id: "single", name: "Single Room", img: "img/rooms/single.jpg", price: 1000, guests: 1, beds: "1 single bed", size: 14, units: 6,
    amenities: ["Wi-Fi", "Hot shower", "Desk"], text: "A quiet, compact room for one, with everything you need after a long day on the trail." },
  { id: "double", name: "Double Room", img: "img/rooms/double.jpg", price: 1200, guests: 2, beds: "2 single beds", size: 18, units: 6,
    amenities: ["Wi-Fi", "Hot shower", "Tea and coffee"], text: "Two comfortable beds and a sitting corner. Good for friends travelling together." },
  { id: "balcony", name: "Balcony Room", img: "img/rooms/balcony.jpg", price: 1250, guests: 2, beds: "1 queen bed", size: 20, units: 4,
    amenities: ["Wi-Fi", "Private balcony", "Hot shower", "Garden view"], text: "Morning tea on your own balcony, looking over the garden towards the hills." },
  { id: "singledeluxe", name: "Single Deluxe", img: "img/rooms/singledeluxe.jpg", price: 1250, guests: 1, beds: "1 double bed", size: 18, units: 4,
    amenities: ["Wi-Fi", "Air conditioning", "Smart TV", "Work desk"], text: "More space and a proper desk, for solo travellers who also need to get some work done." },
  { id: "queen", name: "Deluxe Queen", img: "img/rooms/queen.jpg", price: 1300, guests: 2, beds: "1 queen bed", size: 22, units: 5,
    amenities: ["Wi-Fi", "Air conditioning", "Smart TV", "Mini fridge"], text: "Our most booked room: a large queen bed, a sofa and a big window." },
  { id: "family", name: "Family Room", img: "img/rooms/family.jpg", price: 1450, guests: 4, beds: "1 queen + 2 single beds", size: 30, units: 3,
    amenities: ["Wi-Fi", "Hot shower", "Extra space", "Tea and coffee"], text: "Room for the whole family, with a queen bed and two singles." },
  { id: "doubledeluxe", name: "Double Deluxe", img: "img/rooms/doubledeluxe.jpg", price: 1500, guests: 3, beds: "2 double beds", size: 28, units: 3,
    amenities: ["Wi-Fi", "Air conditioning", "Smart TV", "Bathtub"], text: "Two double beds and a bathtub. Plenty of room for three." },
  { id: "king", name: "King Suite", img: "img/rooms/king.jpg", price: 2400, guests: 2, beds: "1 king bed", size: 36, units: 2,
    amenities: ["Wi-Fi", "Air conditioning", "Lake view", "Bathtub", "Lounge area"], text: "Our largest room, with a lounge area and a view of the lake." },
];

const ADVENTURES = [
  { id: "paragliding", name: "Paragliding", img: "img/adventures/paragliding.jpg", place: "Sarangkot, Pokhara", price: 4000, hours: 3, level: "Easy",
    text: "A tandem flight from Sarangkot over Phewa Lake with a licensed pilot. Pick-up from the hotel included." },
  { id: "bungee", name: "Bungee Jumping", img: "img/adventures/bungee.jpg", place: "Hemja, Pokhara", price: 3500, hours: 4, level: "Hard",
    text: "A jump over the Modi river gorge, with full safety briefing and certificate." },
  { id: "rafting", name: "White-water Rafting", img: "img/adventures/rafting.jpg", place: "Seti river", price: 1200, hours: 6, level: "Moderate",
    text: "A half-day trip on grade III rapids with lunch on the riverbank." },
  { id: "safari", name: "Jungle Safari", img: "img/adventures/safari.jpg", place: "Chitwan", price: 2500, hours: 8, level: "Easy",
    text: "A jeep safari in Chitwan National Park looking for rhinos, deer and, with luck, a tiger." },
  { id: "abc", name: "Annapurna Base Camp Trek", img: "img/adventures/abctrek.jpg", place: "Annapurna region", price: 12000, hours: 0, days: 7, level: "Hard",
    text: "Seven days to the foot of Annapurna I with a licensed guide. Permits and tea-house stays included." },
  { id: "heli", name: "Mountain Helicopter Ride", img: "img/adventures/helicopterride.jpg", place: "Annapurna range", price: 10000, hours: 2, level: "Easy",
    text: "A short flight close to the Annapurna peaks, with a landing for photos when the weather allows." },
  { id: "rope", name: "Rope Climbing", img: "img/adventures/rope.jpg", place: "Hotel garden", price: 2500, hours: 2, level: "Moderate",
    text: "A rope and climbing course in our garden, with an instructor. Good for families." },
  { id: "campfire", name: "Campfire Evening", img: "img/adventures/campfire.jpg", place: "Hotel garden", price: 2700, hours: 3, level: "Easy",
    text: "Music, barbecue and a campfire under the stars, for groups of up to ten." },
];

const FOOD = [
  { id: "thakali", name: "Thakali Khana Set", cat: "Lunch & dinner", img: "img/foods/thakali.jpg", price: 350, tags: ["Nepali", "Popular"] },
  { id: "vegthakali", name: "Veg Khana Set", cat: "Lunch & dinner", img: "img/foods/vegthakali.jpg", price: 220, tags: ["Nepali", "Vegetarian"] },
  { id: "roti", name: "Roti Khana Set", cat: "Lunch & dinner", img: "img/foods/rotikhana.jpg", price: 180, tags: ["Nepali", "Vegetarian"] },
  { id: "chimomo", name: "Chicken Momo", cat: "Momo", img: "img/foods/chimomo.jpg", price: 200, tags: ["Popular"] },
  { id: "buffmomo", name: "Buff Momo", cat: "Momo", img: "img/foods/buffmomo.jpg", price: 180, tags: [] },
  { id: "vegmomo", name: "Veg Momo", cat: "Momo", img: "img/foods/vegmomo.jpg", price: 120, tags: ["Vegetarian"] },
  { id: "jholmomo", name: "Jhol Momo", cat: "Momo", img: "img/foods/jholmomo.jpg", price: 250, tags: ["Spicy"] },
  { id: "cheesemomo", name: "Cheese Momo", cat: "Momo", img: "img/foods/cheesemomo.jpg", price: 220, tags: ["Vegetarian"] },
  { id: "chowmein", name: "Chowmein", cat: "Lunch & dinner", img: "img/foods/chowmein.jpg", price: 150, tags: [] },
  { id: "friedrice", name: "Fried Rice", cat: "Lunch & dinner", img: "img/foods/friedrice.jpg", price: 130, tags: [] },
  { id: "chicken", name: "Fried Chicken", cat: "Lunch & dinner", img: "img/foods/chicken.jpg", price: 250, tags: [] },
  { id: "pizza", name: "Chicken Pizza", cat: "Pizza & burgers", img: "img/foods/pizza.jpg", price: 450, tags: [] },
  { id: "cheesepizza", name: "Cheese Pizza", cat: "Pizza & burgers", img: "img/foods/cheesepizza.jpg", price: 350, tags: ["Vegetarian"] },
  { id: "chiburger", name: "Chicken Burger", cat: "Pizza & burgers", img: "img/foods/chiburger.jpg", price: 220, tags: [] },
  { id: "vegburger", name: "Veg Burger", cat: "Pizza & burgers", img: "img/foods/vegburger.jpg", price: 135, tags: ["Vegetarian"] },
  { id: "omlette", name: "Omelette", cat: "Breakfast", img: "img/foods/omlette.jpg", price: 50, tags: [] },
  { id: "breadomlete", name: "Bread with Omelette", cat: "Breakfast", img: "img/foods/breadwithomlete.jpg", price: 150, tags: [] },
  { id: "milktea", name: "Milk Tea", cat: "Drinks", img: "img/foods/milktea.jpg", price: 80, tags: [] },
  { id: "greentea", name: "Green Tea", cat: "Drinks", img: "img/foods/greentea.jpg", price: 70, tags: [] },
  { id: "americano", name: "Americano", cat: "Drinks", img: "img/foods/americano.jpg", price: 200, tags: [] },
  { id: "latte", name: "Coffee Latte", cat: "Drinks", img: "img/foods/coffeelatte.jpg", price: 220, tags: [] },
  { id: "icelatte", name: "Iced Latte", cat: "Drinks", img: "img/foods/icelatte.jpg", price: 200, tags: [] },
  { id: "icemocha", name: "Iced Mocha", cat: "Drinks", img: "img/foods/icemocha.jpg", price: 290, tags: [] },
  { id: "milkshake", name: "Milkshake", cat: "Drinks", img: "img/foods/milkshake.jpg", price: 180, tags: [] },
  { id: "vanilla", name: "Vanilla Shake", cat: "Drinks", img: "img/foods/vanillashake.jpg", price: 200, tags: [] },
  { id: "coke", name: "Coca-Cola", cat: "Drinks", img: "img/foods/coke.jpg", price: 80, tags: [] },
  { id: "fanta", name: "Fanta", cat: "Drinks", img: "img/foods/fanta.jpg", price: 80, tags: [] },
  { id: "tuborg", name: "Tuborg", cat: "Drinks", img: "img/foods/tuborg.jpg", price: 220, tags: ["18+"] },
  { id: "nepalice", name: "Nepal Ice", cat: "Drinks", img: "img/foods/nepalice.jpg", price: 180, tags: ["18+"] },
];

const PACKAGES = [
  { id: "silver", name: "Silver", nights: 2, price: 5500, img: "img/rooms/double.jpg",
    includes: ["2 nights in a Double Room", "Breakfast every day", "Campfire evening for two"] },
  { id: "gold", name: "Gold", nights: 3, price: 14500, img: "img/rooms/queen.jpg", popular: true,
    includes: ["3 nights in a Deluxe Queen", "Breakfast and dinner every day", "Paragliding for two", "Airport pick-up"] },
  { id: "platinum", name: "Platinum", nights: 4, price: 32000, img: "img/rooms/king.jpg",
    includes: ["4 nights in the King Suite", "All meals", "Paragliding and rafting for two", "Mountain helicopter ride for two", "Airport pick-up and drop"] },
];

const EXTRAS = [
  { id: "breakfast", name: "Breakfast", price: 300, per: "person / night" },
  { id: "pickup", name: "Airport pick-up", price: 800, per: "trip" },
  { id: "late", name: "Late check-out (2 pm)", price: 500, per: "stay" },
];
