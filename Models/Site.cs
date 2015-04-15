using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;
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

        public async Task GetSite()
        {
            var site = await DatabaseContext.Site.Find(new BsonDocument()).SingleOrDefaultAsync();

            Id = site.Id;

            ProjectName = site.ProjectName;

            Components = JsonConvert.DeserializeObject<List<Component>>(
                File.ReadAllText(HttpContext.Current.Server.MapPath("/components.json")));

            Pages = await DatabaseContext.Pages.Find(new BsonDocument()).ToListAsync();
            Pages.ForEach(p =>
            {
                var components = DatabaseContext.Components.Find(Builders<Component>.Filter.Eq(c => c.PageFk, p.Id)).ToListAsync();
                components.Wait();
                if (!components.IsFaulted)
                    p.Components = components.Result;
            });
        }

        public async Task NewSite(string name)
        {
            ProjectName = name;

            await DatabaseContext.Site.InsertOneAsync(this);
        }
    }
}