using cms;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace nanoplex_cms.Controllers
{
    public class PageController : Controller
    {
        [HttpPost]
        public async Task Add(string id)
        {
            var newOrder = DatabaseContext.Pages.FindAsync(Builders<Page>.Filter.Exists(p => p.Order, true));
            newOrder.Wait();

            await DatabaseContext.Pages.InsertOneAsync(new Page { Name = id, Visible = true });
        }

        [HttpPost]
        public async Task Delete(string id)
        {
            await DatabaseContext.Pages.DeleteOneAsync(Builders<Page>.Filter.Eq(p => p.Name, id));
        }

        [HttpPost]
        public async Task NewName(string name, string value)
        {
            var query = DatabaseContext.Pages.FindAsync(Builders<Page>.Filter.Eq(p => p.Name, name));
            query.Wait();
            await query.Result.MoveNextAsync();
            var page = query.Result.Current.FirstOrDefault();
            if (page != null)
            {
                page.Name = value;

                await DatabaseContext.Pages.UpdateOneAsync(Builders<Page>.Filter.Eq(p => p.Name, name), Builders<Page>.Update.Set(p => p.Name, value));
            }
        }

        [HttpGet]
        public async Task<string> Get(string id)
        {
            var query = await DatabaseContext.Pages.FindAsync(Builders<Page>.Filter.Eq(p => p.Name, id));

            var pages = await query.ToListAsync();

            if (pages.Count > 0)
            {
                return pages[0].toHTML();
            }
            else
            {
                return "error";
            }
        }

        [HttpGet]
        public async Task<string> All()
        {
            var pages = await DatabaseContext.Pages.Find(Builders<Page>.Filter.Eq(p => p.Visible, true)).ToListAsync();
            
            return System.Web.Helpers.Json.Encode(pages);
        }
    }
}