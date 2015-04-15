using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Threading.Tasks;

namespace cms.Models
{
    public class Page
    {
        public ObjectId Id { get; set; }
        public string Name { get; set; }
        public bool Visible { get; set; }
        public int Order { get; set; }
        public List<Component> Components { get; set; }

        public static async Task Add(string name, int order)
        {
            var page = new Page { Name = name, Visible = true, Order = order };

            await DatabaseContext.Pages.InsertOneAsync(page);
        }
        
        public async Task Edit()
        {
            await DatabaseContext.Pages.UpdateOneAsync<Page>(
                p => p.Id == Id,
                Builders<Page>.Update
                    .Set(p => p.Name, Name)
                    .Set(p => p.Visible, Visible)
                    .Set(p => p.Order, Order)
                    .Set(p => p.Components, Components));
        }

        public static async Task Delete(ObjectId id)
        {
            await DatabaseContext.Pages.DeleteOneAsync(
                p => p.Id ==  id);
        }
    }
}