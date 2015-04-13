using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MongoDB.Bson;

namespace cms.Models
{
    public class Page
    {
        public ObjectId Id { get; set; }
        public string Name { get; set; }
        public bool Visible { get; set; }
        public List<dynamic> Components { get; set; }

        public void NewPage(string name)
        {
            Name = name;
            Visible = true;

            DatabaseContext.Pages.InsertOneAsync(this);
        }
    }
}