using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace cms
{
    public class Page
    {
        public ObjectId Id { get; set; }
        public string Name { get; set; }
        public List<Component> Components { get; set; }
        public int Order { get; set; }
        public bool Visible { get; set; }

        public string toHTML()
        {
            var str = "";

            Components.ForEach(c => 
            {
                str += c.toHTML();
            });

            return str;
        }
    }
}