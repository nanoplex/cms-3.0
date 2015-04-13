using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace cms.Models
{
    public class Site
    {
        public ObjectId Id { get; set; }
        public string ProjectName { get; set; }
        public List<Page> Pages { get; set; }

        public async Task GetSite()
        {
            var site = await DatabaseContext.Site.Find(new BsonDocument()).SingleOrDefaultAsync();

            Id = site.Id;
            ProjectName = site.ProjectName;
            Pages = await DatabaseContext.Pages.Find(new BsonDocument()).ToListAsync();
        }

        public async Task NewSite(string name)
        {
            ProjectName = name;

            await DatabaseContext.Site.InsertOneAsync(this);
        }
    }
}