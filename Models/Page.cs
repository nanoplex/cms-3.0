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
        public List<PageView> Views { get; set; }

        public async Task Edit()
        {
            await DatabaseContext.Pages.UpdateOneAsync<Page>(
                p => p.Id == Id,
                Builders<Page>.Update
                    .Set(p => p.Visible, Visible)
                    .Set(p => p.Order, Order));
        }
    }
}