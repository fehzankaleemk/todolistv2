//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//mongodb online cluster : mongodb+srv://admin-faizan:test123@atlascluster.awmueiv.mongodb.net/todolistDB
mongoose.connect("mongodb+srv://admin-faizan:test123@atlascluster.awmueiv.mongodb.net/todolistDB"); //todolistDB is the name of the database that you want to create or access

//Create schema for you entries in database. Create a mongoose model based on the schema. This will be used for out default list
const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

// Create List model Model for our Schema. This will be used for out custom lists
const List = mongoose.model("List", listSchema);

//To add in bulk

const teeth = new Item({
  name: "Brush Teeth"
});

const eat = new Item({
  name: "Eat Dinner"
});

const play = new Item({
  name: "Play Videogames"
});

var items;
const defaultItems = [teeth, eat, play];
//Item.insertMany(defaultItems);

// To read the database. The aync / await function is necessary
// async function findAll() {
//   items = await Item.find({});
//   //console.log(items.length);
//   items.forEach(function(item) {
//     console.log(item.name);
//   });
// }
// findAll();


app.get("/", function(req, res) {
  Item.find({}).then(function(foundItems) {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems);
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: foundItems
        });
      }
    })
    .catch(function(err) {
      console.log(err);
    });
});



//const findFruit = findOneFruit("Banana");

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list; //This .list comes from the name of the button
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
        name: listName
      }).then(function(foundList) {
        foundList.items.push(item); //Adds the item in the existing array of items
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch(function(err) {
        console.log(err);
      });

  }


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res) {
  const checkedboxId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") //Our default list
  {
    deletebyId(checkedboxId);
    res.redirect("/");
  } else //Out custom list
  {
    List.findOneAndUpdate({
        name: listName
      }, {
        $pull: { //This is a mongodb command
          items: { //Array in listSchema
            _id: checkedboxId // Checks if an item in the array matches the id sent by the list.ejs
          }
        }
      }).then(function(foundList) {
        res.redirect("/" + listName);
      })
      .catch(function(err) {
        console.log(err);
      });
  }


});

async function deletebyId(id) {
  const res = await Item.deleteOne({
    _id: id
  });
}


//This is for dynamic url
app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
      name: customListName
    }).then(function(foundList) {
      if (!foundList) {
        //Create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    })
    .catch(function(err) {
      console.log(err);
    });

});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});


//Sample Code
// Item.find({}).then(function(foundItems){
//   res.render("list", { listTitle: "Today", newListItems: foundItems });
// })
// .catch(function(err){
//   console.log(err);
// });
