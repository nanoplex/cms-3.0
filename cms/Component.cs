using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace cms
{
    public class Component
    {
        public ObjectId Id { get; set; }
        public string Name { get; set; }
        public List<Property> Properties { get; set; }

        public string toHTML()
        {
            var str = $"<{Name} ";

            Properties.ForEach(p =>
            {
                str += p.toHTML();
            });

            return str +=  $"></{Name}>";
        }
    }
}