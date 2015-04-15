using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace cms.Models
{
    public class Property
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public object Value { get; set; }
        public string Validation { get; set; }
    }
}