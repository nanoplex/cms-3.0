using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System.Web;

namespace cms.Models
{
    public class Site
    {
        public ObjectId Id { get; set; }
        public string ProjectName { get; set; }
        public List<Component> Components { get; set; }
        public List<Page> Pages { get; set; }
        public bool StatisticsOn { get; set; }

        public async Task GetSite()
        {
            var site = await DatabaseContext.Site.Find(new BsonDocument()).SingleOrDefaultAsync();

            if (site != null)
            {
                Id = site.Id;

                ProjectName = site.ProjectName;
                StatisticsOn = site.StatisticsOn;

                Components = JsonConvert.DeserializeObject<List<Component>>(
                    File.ReadAllText(HttpContext.Current.Server.MapPath("/components.json")));

                Pages = GetPages();
            }

        }
        public List<Page> GetPages()
        {
            var pages = DatabaseContext.Pages.Find(new BsonDocument()).ToListAsync();
            pages.Wait();

            pages.Result.ForEach(p =>
            {
                var components = DatabaseContext.Components.Find(Builders<Component>.Filter.Eq(c => c.PageFk, p.Id)).ToListAsync();
                components.Wait();

                Task<List<PageView>> views;

                if (StatisticsOn)
                {
                    views = DatabaseContext.Views.Find(Builders<PageView>.Filter.Eq(v => v.PageFk, p.Id)).ToListAsync();
                    views.Wait();
                    p.Views = views.Result;
                }

                p.Components = components.Result;
            });

            return pages.Result;
        }
    }
}