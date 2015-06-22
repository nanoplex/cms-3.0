using cms;
using MongoDB.Driver;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace nanoplex_cms.Controllers
{
    public class ComponentController : Controller
    {
        [HttpPost]
        public async Task Add(string pageName, Component component)
        {
            var page = await GetPage(pageName);

            if (page.Components == null)
                page.Components = new List<Component>();

            page.Components.Add(component);

            await UpdatePage(pageName, page.Components);
        }

        [HttpPost]
        public async Task Update(string pageName, int index, Component component)
        {
            var page = await GetPage(pageName);
            
            page.Components[index] = component;

            await UpdatePage(pageName, page.Components);
        }

        [HttpPost]
        public async Task Delete(string pageName, int index)
        {
            var page = await GetPage(pageName);

            page.Components.Remove(page.Components[index]);

            await UpdatePage(pageName, page.Components);
        }

        [HttpGet]
        public async Task<string> Types()
        {
            Discover();

            var types = await DatabaseContext.ComponentTypes
                .Find(Builders<Component>.Filter.Ne(c => c.Name, ""))
                .ToListAsync();

            return System.Web.Helpers.Json.Encode(types);
        }

        [HttpPost]
        public void Discover()
        {
            var componentPath = "D:\\projects\\nanoplex-cms\\nanoplex-cms\\Components";
            var components = new List<Component>();
            var componentFolders = Directory.GetDirectories(componentPath);

            foreach (var path in componentFolders)
            {
                var name = Regex.Match(path, @"[\w-]+$").Value;
                var folder = Directory.EnumerateFiles(path).ToList();
                var jsonFile = folder.Where(f => f.EndsWith($"{name}.json"))?.First();

                if (jsonFile != null)
                {
                    jsonFile = System.IO.File.ReadAllText(jsonFile);

                    components.Add(new Component(name, jsonFile));
                }
            }

            Parallel.ForEach(components, c =>
            {
                var t = DatabaseContext.ComponentTypes.Find(
                    Builders<Component>.Filter.Eq(C => C.Name, c.Name)).FirstOrDefaultAsync();
                t.Wait();
                
                if (t.Result == null)
                {
                    DatabaseContext.ComponentTypes.InsertOneAsync(c).Wait();
                }
                else
                {
                    DatabaseContext.ComponentTypes.DeleteOneAsync(Builders<Component>.Filter.Eq(C => C.Name, c.Name)).Wait();
                }
            });
        }

        private async Task<Page> GetPage(string pageName)
        {
            return await DatabaseContext.Pages.Find(Builders<Page>.Filter.Eq(p => p.Name, pageName)).FirstOrDefaultAsync();
        }

        private async Task UpdatePage(string pageName, List<Component> components)
        {
            await DatabaseContext.Pages.UpdateOneAsync(
                Builders<Page>.Filter.Eq(p => p.Name, pageName),
                Builders<Page>.Update.Set(p => p.Components, components));
        }
    }
}