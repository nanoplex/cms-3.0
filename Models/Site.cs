using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace cms.Models
{
    public class Site
    {
        public string ProjectName { get; set; }
        public List<Page> Pages { get; set; }

        public void NewSite(string name)
        {
            ProjectName = name;

            DatabaseContext.Site.InsertOneAsync(this);
        }
    }
}