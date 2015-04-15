using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace cms.Models
{
    public class Component
    {
        public ObjectId Id { get; set; }
        public string Name { get; set; }
        public List<Property> Properties { get; set; }
        public string Frontend { get; set; }
        public ObjectId PageFk { get; set; }

        public static async Task Add(string name, List<Property> properties, string frontend, ObjectId pageFk)
        {
            var component = new Component { Name = name, Properties = properties, Frontend = frontend, PageFk = pageFk };

            await DatabaseContext.Components.InsertOneAsync(component);
        }

        public async Task Edit()
        {
            await DatabaseContext.Components.UpdateOneAsync<Component>(
                c => c.Id == Id,
                Builders<Component>.Update
                    .Set(c => c.Properties, Properties));
        }

        public static async Task Delete(ObjectId id)
        {
            await DatabaseContext.Components.DeleteOneAsync<Component>(
                c => c.Id == id);
        }
    }
}