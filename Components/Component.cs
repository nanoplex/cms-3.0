using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace cms.Components
{
    public abstract class Component
    {
        [Unused]
        public ObjectId Id { get; set; }

        [Unused]
        public abstract string Frontend { get; set; }
    }
}