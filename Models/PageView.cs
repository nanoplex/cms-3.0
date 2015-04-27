using MongoDB.Bson;
using System;
using System.Collections.Generic;

namespace cms.Models
{
    public class PageView
    {
        public ObjectId Id { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Browser { get; set; }
        public string OS { get; set; }
        public string IP { get; set; }
        public string Language { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public string Longitude { get; set; }
        public string Latitude { get; set; }
        public ObjectId PageFk { get; set; }
    }
}